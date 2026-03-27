#pragma once
#include <string>
#include <boost/asio/awaitable.hpp>

namespace Playground::Sandbox {
    struct ExecutionResult {
        std::string status;
        std::string output;
            double time_ms = 0.0; // 运行耗时 (毫秒)
    long memory_kb = 0;   // 内存消耗 (KB)
    };

    // 变更为异步协程接口
    boost::asio::awaitable<ExecutionResult> async_execute_code(const std::string& code);
}
