#include "sandbox.hpp"
#include "utils.hpp"
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <boost/asio/thread_pool.hpp>
#include <boost/asio/post.hpp>
#include <boost/asio/use_awaitable.hpp>
#include <atomic>
#include <iostream>

namespace fs = std::filesystem;

// 替换为原生进程沙盒线程池 (因 isolate 极度轻量，并发上限可直接拉高至 CPU 核心数的 2-4 倍)
// 此处设定为 16 并发
static boost::asio::thread_pool sandbox_task_pool{16};

// 用于给并发任务分配唯一的 isolate Box ID (范围 0-999)
static std::atomic<int> box_id_allocator{0};

template <typename CompletionToken>
auto async_system(const std::string& cmd, CompletionToken&& token) {
    return boost::asio::async_initiate<CompletionToken, void(int)>(
        [](auto handler, std::string cmd) {
            auto current_io_ex = boost::asio::get_associated_executor(handler);
            boost::asio::post(sandbox_task_pool, [handler = std::move(handler), current_io_ex, cmd]() mutable {
                int res = std::system(cmd.c_str());
                boost::asio::post(current_io_ex, [handler = std::move(handler), res]() mutable {
                    handler(res);
                });
            });
        },
        token, cmd
    );
}

namespace Playground::Sandbox {
    boost::asio::awaitable<ExecutionResult> async_execute_code(const std::string& code) {
        ExecutionResult result;
        
        // 1. 分配 Box ID
        int box_id = ++box_id_allocator % 1000;
        std::string box_id_str = std::to_string(box_id);

        // 2. 初始化 isolate 沙盒目录
        std::string init_cmd = "isolate --cg -b " + box_id_str + " --init > /dev/null 2>&1";
        int init_res = co_await async_system(init_cmd, boost::asio::use_awaitable);
        if (init_res != 0) {
            result.status = "error";
            result.output = "[Daemon] Failed to initialize sandbox environment.\n";
            co_return result;
        }

        fs::path box_dir = fs::path("/var/local/lib/isolate") / box_id_str / "box";
        
        // 3. 写入用户代码
        std::ofstream out(box_dir / "main.cpp");
        out << code; 
        out.close();

        // 4. 宿主机环境编译
        std::string compile_cmd = "timeout 5 g++ " + (box_dir / "main.cpp").string() + 
                                  " -o " + (box_dir / "main").string() + 
                                  " 2> " + (box_dir / "compile.err").string();
        
        int compile_res = co_await async_system(compile_cmd, boost::asio::use_awaitable);
        std::string compile_err = Utils::read_file(box_dir / "compile.err");

        if (compile_res != 0 || !compile_err.empty()) {
            result.status = "success"; 
            result.output = "[Compilation Error]\n" + compile_err;
        } else {
            // 5. 隔离执行已编译的二进制文件
            // 修正 1: 使用绝对路径重定向 stdout 和 stderr 防止文件冲撞
            // 修正 2: 移除 -M meta.txt 规避权限问题
            // 修正 3: 执行命令改为 ./main 确保能在沙盒 PATH 中被找到
// --stdout 和 --stderr 必须填写沙盒内部的相对路径
std::string run_cmd = "isolate --cg -b " + box_id_str + 
                                  " -t 5 -m 128000 --processes" + 
                                  " --stdout=run.out" +
                                  " --stderr=run.err" +
                                  " --run -- ./main";
            
            int run_res = co_await async_system(run_cmd, boost::asio::use_awaitable);
            
            std::string run_out = Utils::read_file(box_dir / "run.out");
            std::string run_err = Utils::read_file(box_dir / "run.err");
            
            if (run_res != 0 && run_out.empty() && run_err.empty()) {
                result.status = "success"; 
                result.output = "[Runtime Error] Terminated (Timeout / OOM / Segfault).\n";
            } else {
                result.status = "success"; 
                result.output = run_out + run_err;
                if (result.output.empty()) result.output = "(No output)";
            }
        }

        // 6. 销毁沙盒清理磁盘
        std::string cleanup_cmd = "isolate --cg -b " + box_id_str + " --cleanup > /dev/null 2>&1";
        co_await async_system(cleanup_cmd, boost::asio::use_awaitable);

        co_return result;
    }
}