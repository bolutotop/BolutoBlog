#include "sandbox.hpp"
#include "utils.hpp"
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <boost/asio/thread_pool.hpp>
#include <boost/asio/post.hpp>
#include <boost/asio/use_awaitable.hpp>
#include <atomic>
#include <iostream>
#include <unordered_map>

namespace fs = std::filesystem;

static boost::asio::thread_pool sandbox_task_pool{16};
static std::atomic<int> box_id_allocator{0};

// 解析 isolate 生成的 meta 文件
std::unordered_map<std::string, std::string> parse_meta_file(const fs::path& meta_path) {
    std::unordered_map<std::string, std::string> meta_data;
    std::ifstream infile(meta_path);
    std::string line;
    while (std::getline(infile, line)) {
        auto pos = line.find(':');
        if (pos != std::string::npos) {
            meta_data[line.substr(0, pos)] = line.substr(pos + 1);
        }
    }
    return meta_data;
}



// 在 sandbox.cpp 或 utils.cpp 中实现一个带截断的文件读取函数
std::string read_file_safely(const std::filesystem::path& path, size_t max_bytes = 65536) {
    if (!std::filesystem::exists(path)) return "";
    
    std::ifstream ifs(path, std::ios::binary | std::ios::ate);
    std::streamsize size = ifs.tellg();
    ifs.seekg(0, std::ios::beg);

    if (size <= max_bytes) {
        std::string buffer(size, '\0');
        if (ifs.read(&buffer[0], size)) return buffer;
        return "";
    } else {
        // 文件过大，只读取前 max_bytes 字节，并追加提示
        std::string buffer(max_bytes, '\0');
        ifs.read(&buffer[0], max_bytes);
        return buffer + "\n\n... [Output Truncated. Exceeded 64KB display limit] ...\n";
    }
}


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
        
        // 🚀 1. 架构升级：分配两个独立的 Box ID (0-499 为编译区, 500-999 为运行区)
        int base_id = ++box_id_allocator % 500;
        std::string comp_box_id = std::to_string(base_id);
        std::string run_box_id = std::to_string(base_id + 500);

        // 初始化两个沙盒环境
        std::string init_comp_cmd = "isolate --cg -b " + comp_box_id + " --init > /dev/null 2>&1";
        std::string init_run_cmd = "isolate --cg -b " + run_box_id + " --init > /dev/null 2>&1";
        
        if (co_await async_system(init_comp_cmd, boost::asio::use_awaitable) != 0 || 
            co_await async_system(init_run_cmd, boost::asio::use_awaitable) != 0) {
            result.status = "error";
            result.output = "[System] Failed to initialize dual-sandbox environment.\n";
            co_return result;
        }

        // 定义路径
        fs::path comp_dir = fs::path("/var/local/lib/isolate") / comp_box_id / "box";
        fs::path run_dir = fs::path("/var/local/lib/isolate") / run_box_id / "box";
        fs::path meta_file = fs::temp_directory_path() / ("isolate_meta_" + run_box_id + ".txt");
        
        // 写入用户代码到【编译沙盒】
        std::ofstream out(comp_dir / "main.cpp");
        out << code; 
        out.close();

        // 🚀 2. 在【编译沙盒】中执行编译 (它产生的 40MB 缓存污染会被留在 comp_box 中)
        std::string compile_cmd = "isolate --cg -b " + comp_box_id + 
                                  " --time=10.0 --wall-time=15.0" +
                                  " --cg-mem=1048576" + 
                                  " --processes=64" +
                                  " --fsize=51200" + 
                                  " -E PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" +
                                  " --stderr=compile.err" +
                                  " --run -- /usr/bin/g++ -O2 main.cpp -o main";
        
        int compile_res = co_await async_system(compile_cmd, boost::asio::use_awaitable);
        std::string compile_err = Utils::read_file(comp_dir / "compile.err");

        if (compile_res == 124 || compile_res == 31744 || compile_res == 9) {
            result.status = "compile_error";
            result.output = "[Compilation Error] Compile time/memory limit exceeded.";
        } else if (compile_res != 0 || !compile_err.empty()) {
            result.status = "compile_error"; 
            result.output = "[Compilation Error]\n" + compile_err;
        } else {
            // 🚀 3. 跨沙盒物理拷贝：将安全的二进制产物，移动到 100% 内存纯净的【运行沙盒】
            std::error_code ec;
            fs::copy_file(comp_dir / "main", run_dir / "main", fs::copy_options::overwrite_existing, ec);
            
            if (ec) {
                result.status = "error";
                result.output = "[System] Failed to transfer executable to runtime sandbox.";
            } else {
                // 🚀 4. 在【运行沙盒】中执行程序 (此时读取的 meta 内存数据将绝对精准)
                std::string run_cmd = "isolate --cg -b " + run_box_id + 
                                      " --meta=" + meta_file.string() +
                                      " --time=2.0 --wall-time=3.0" +
                                      " --cg-mem=131072" + 
                                      " --processes=32" +
                                      " --fsize=10240" + 
                                      " -E PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" + 
                                      " --env=HOME=/tmp" + 
                                      " --full-env" + 
                                      " --stdout=run.out" +
                                      " --stderr=run.err" +
                                      " --run -- ./main";
                
                co_await async_system(run_cmd, boost::asio::use_awaitable);
                
                // 注意：读取路径改为 run_dir
                std::string run_out = Utils::read_file(run_dir / "run.out"); // 建议换成截断版本的 read_file_safely
                std::string run_err = Utils::read_file(run_dir / "run.err");
                
                // 解析 meta_file ... (与原逻辑完全一致，此处省略)
                auto meta = parse_meta_file(meta_file);
                if (meta.count("time")) result.time_ms = std::stod(meta["time"]) * 1000.0;
                if (meta.count("cg-mem")) result.memory_kb = std::stol(meta["cg-mem"]);
                
                if (meta.count("status")) {
                    std::string st = meta["status"];
                    if (st == "TO") {
                        result.status = "timeout";
                        result.output = "[Runtime Error] Execution timed out (>2.0s).\n" + run_out + run_err;
                    } else if (st == "OOM" || (meta.count("message") && meta["message"].find("Memory") != std::string::npos)) {
                        result.status = "oom";
                        result.output = "[Runtime Error] Out of memory (>128MB).\n" + run_out + run_err;
                    } else if (st == "SG" || st == "RE") {
                        result.status = "runtime_error";
                        result.output = "[Runtime Error] Segmentation fault or fatal error.\n" + run_err;
                    } else {
                        result.status = "error";
                        result.output = "[Runtime Error] Unknown crash.\n" + run_err;
                    }
                } else {
                    result.status = "success"; 
                    result.output = run_out + run_err;
                    if (result.output.empty()) result.output = "(No output)";
                }
            }
        }

        // 🚀 5. 销毁两个沙盒现场
        co_await async_system("isolate --cg -b " + comp_box_id + " --cleanup > /dev/null 2>&1", boost::asio::use_awaitable);
        co_await async_system("isolate --cg -b " + run_box_id + " --cleanup > /dev/null 2>&1", boost::asio::use_awaitable);
        if (fs::exists(meta_file)) fs::remove(meta_file);

        co_return result;
    }
}