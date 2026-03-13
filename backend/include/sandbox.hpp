#pragma once
#include <string>
#include <boost/asio/awaitable.hpp>

namespace Playground::Sandbox {
    struct ExecutionResult {
        std::string status;
        std::string output;
    };

    // 变更为异步协程接口
    boost::asio::awaitable<ExecutionResult> async_execute_code(const std::string& code);
}