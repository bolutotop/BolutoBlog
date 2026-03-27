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
        
        int box_id = ++box_id_allocator % 1000;
        std::string box_id_str = std::to_string(box_id);

        std::string init_cmd = "isolate --cg -b " + box_id_str + " --init > /dev/null 2>&1";
        if (co_await async_system(init_cmd, boost::asio::use_awaitable) != 0) {
            result.status = "error";
            result.output = "[System] Failed to initialize sandbox environment.\n";
            co_return result;
        }

        // 基础路径设置
   fs::path base_dir = fs::path("/var/local/lib/isolate") / box_id_str;
fs::path box_dir = base_dir / "box";
// ✅ 转移到系统的临时目录，并附带 box_id 防止并发冲突
fs::path meta_file = fs::temp_directory_path() / ("isolate_meta_" + box_id_str + ".txt");
        
        std::ofstream out(box_dir / "main.cpp");
        out << code; 
        out.close();

        // 编译阶段：限制编译时间和文件大小 (防止 #include </dev/urandom> 等攻击)
        // 建议未来将编译过程也放入 isolate 容器中执行，当前先在宿主机加限制
        std::string compile_cmd = "timeout 5 g++ -O2 " + (box_dir / "main.cpp").string() + 
                                  " -o " + (box_dir / "main").string() + 
                                  " 2> " + (box_dir / "compile.err").string();
        
        int compile_res = co_await async_system(compile_cmd, boost::asio::use_awaitable);
        std::string compile_err = Utils::read_file(box_dir / "compile.err");

        // 124 是 linux timeout 命令超时的退出码
        if (compile_res == 124 || compile_res == 31744) {
            result.status = "compile_error";
            result.output = "[Compilation Error] Compile time limit exceeded. (Possible compilation bomb)";
        } else if (compile_res != 0 || !compile_err.empty()) {
            result.status = "compile_error"; 
            result.output = "[Compilation Error]\n" + compile_err;
        } else {
            // 执行阶段：配置严格资源限制并输出 meta 探针
            // --time=2 : CPU时间 2秒
            // --wall-time=3 : 绝对时间 3秒 (防止纯睡眠挂起)
            // --cg-mem=131072 : 内存上限 128MB
            // --fsize=10240 : 文件写入上限 10MB
            std::string run_cmd = "isolate --cg -b " + box_id_str + 
                                  " --meta=" + meta_file.string() +
                                  " --time=2.0 --wall-time=3.0" +
                                  " --cg-mem=131072" + 
                                  " --processes=32" +
                                  " --fsize=10240" + 
                                  " --stdout=run.out" +
                                  " --stderr=run.err" +
                                  " --run -- ./main";
            
            co_await async_system(run_cmd, boost::asio::use_awaitable);
            
  // 替换原有的 Utils::read_file
std::string run_out = read_file_safely(box_dir / "run.out", 65536); // 限制标准输出 64KB
std::string run_err = read_file_safely(box_dir / "run.err", 16384); // 限制错误输出 16KB
            
            // 解析运行时指标
            auto meta = parse_meta_file(meta_file);
            
            if (meta.count("time")) {
                result.time_ms = std::stod(meta["time"]) * 1000.0; // isolate 记录的是秒
            }
            if (meta.count("cg-mem")) {
                result.memory_kb = std::stol(meta["cg-mem"]);
            }

            // 异常状态判定
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

        // 清理现场
        std::string cleanup_cmd = "isolate --cg -b " + box_id_str + " --cleanup > /dev/null 2>&1";
        co_await async_system(cleanup_cmd, boost::asio::use_awaitable);
        
        // 删除 meta 文件 (isolate cleanup 不会自动删除外部的 meta 文件)
        if (fs::exists(meta_file)) fs::remove(meta_file);

        co_return result;
    }
}