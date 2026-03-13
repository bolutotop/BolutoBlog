#include <boost/asio/use_awaitable.hpp> // 修复: 引入 use_awaitable 声明
#include "websocket_session.hpp"
#include "sandbox.hpp"
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/json.hpp>
#include <boost/json/src.hpp> // 解决 Boost.JSON 链接问题
#include <iostream>

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace json = boost::json;

namespace Playground::Network {
    net::awaitable<void> do_session(net::ip::tcp::socket socket) {
        try {
            websocket::stream<beast::tcp_stream> ws(std::move(socket));
            ws.set_option(websocket::stream_base::timeout::suggested(beast::role_type::server));
            co_await ws.async_accept(net::use_awaitable);
            
            for (;;) {
                beast::flat_buffer buffer;
                co_await ws.async_read(buffer, net::use_awaitable);

                std::string payload = beast::buffers_to_string(buffer.data());
                boost::system::error_code ec;
                json::value jv = json::parse(payload, ec);
                
                // 校验 JSON 与 Action 字段
                if (ec || !jv.is_object() || !jv.as_object().contains("action") || jv.as_object().at("action").as_string() != "execute") {
                    json::object err; err["status"] = "error"; err["output"] = "Invalid payload.\n";
                    co_await ws.async_write(net::buffer(json::serialize(err)), net::use_awaitable);
                    continue;
                }

                std::string code = std::string(jv.as_object().at("code").as_string());

                // 发送运行状态
                json::object running_res; running_res["status"] = "running"; running_res["output"] = "[Daemon] Sandbox executing...\n";
                co_await ws.async_write(net::buffer(json::serialize(running_res)), net::use_awaitable);

                // 调用沙盒模块执行代码
                Sandbox::ExecutionResult exec_res = co_await Sandbox::async_execute_code(code);

                // 返回执行结果
                json::object final_res;
                final_res["status"] = exec_res.status;
                final_res["output"] = exec_res.output;
                co_await ws.async_write(net::buffer(json::serialize(final_res)), net::use_awaitable);
            }
        } catch (std::exception const& e) {
            // 正常断开连接时将捕获异常，无需额外处理
        }
    }
}