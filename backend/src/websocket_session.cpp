#include <boost/asio/use_awaitable.hpp> // 修复: 引入 use_awaitable 声明
#include "websocket_session.hpp"
#include "sandbox.hpp"
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/json.hpp>
#include <boost/json/src.hpp> // 解决 Boost.JSON 链接问题
#include <iostream>
#include <boost/beast/http.hpp>
namespace http = boost::beast::http;
namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace json = boost::json;

namespace Playground::Network {
    net::awaitable<void> do_session(net::ip::tcp::socket socket) {
        try {
            // 1. 初始化 TCP 流 (暂时不用 ws 包装)
            beast::tcp_stream stream(std::move(socket));
            
            // 2. 先按普通 HTTP 请求读取握手包
            beast::flat_buffer buffer;
            http::request<http::string_body> req;
            co_await http::async_read(stream, buffer, req, net::use_awaitable);

            // 3. 检查是否是合法的 WebSocket 升级请求
            if (websocket::is_upgrade(req)) {
                
                // 🚀 防御核心：校验 Origin 来源
                auto origin = req[http::field::origin];

                // if i got domain name like baidu.com ,add this code for that " origin != "https://your_hostname.com" "
                if (origin != "http://localhost:3000" && 
                    origin != "http://127.0.0.1:3000") {
                    
                    std::cerr << "[Security] Blocked unauthorized WS connection from Origin: " 
                              << origin << std::endl;
                    
                    // 校验失败：返回 HTTP 403 Forbidden 并断开连接
                    http::response<http::string_body> res{http::status::forbidden, req.version()};
                    res.set(http::field::server, "BlogPlayground-Daemon");
                    res.body() = "Unauthorized Origin";
                    res.prepare_payload();
                    co_await http::async_write(stream, res, net::use_awaitable);
                    co_return; // 直接结束协程
                }

                // 4. 校验通过：将 TCP 流转移给 WebSocket 并完成协议升级
                websocket::stream<beast::tcp_stream> ws(std::move(stream));
                ws.set_option(websocket::stream_base::timeout::suggested(beast::role_type::server));
                ws.read_message_max(128 * 1024); // 设置载荷限制
                
                // 传入刚才已经读取的 HTTP 请求 (req) 来完成 WS 握手
                co_await ws.async_accept(req, net::use_awaitable);

                // ==========================================
                // 握手成功，进入原本的读写循环
                // ==========================================
                for (;;) {
                    beast::flat_buffer ws_buffer;
                    co_await ws.async_read(ws_buffer, net::use_awaitable);

                    std::string payload = beast::buffers_to_string(ws_buffer.data());
                    // ... [保留你原本的 JSON 解析与 Sandbox 调用逻辑] ...
                    
                    boost::system::error_code ec;
                    json::value jv = json::parse(payload, ec);
                    
                    if (ec || !jv.is_object() || !jv.as_object().contains("action") || jv.as_object().at("action").as_string() != "execute") {
                        json::object err; err["status"] = "error"; err["output"] = "Invalid payload.\n";
                        co_await ws.async_write(net::buffer(json::serialize(err)), net::use_awaitable);
                        continue;
                    }

                    std::string code = std::string(jv.as_object().at("code").as_string());
                    std::string lang = jv.as_object().contains("lang") ? std::string(jv.as_object().at("lang").as_string()) : "cpp";

                    json::object running_res; running_res["status"] = "running"; running_res["output"] = "[Daemon] Sandbox executing...\n";
                    co_await ws.async_write(net::buffer(json::serialize(running_res)), net::use_awaitable);

                    // 调用沙盒模块
                    Sandbox::ExecutionResult exec_res = co_await Sandbox::async_execute_code(code);

                    json::object final_res;
                    final_res["status"] = exec_res.status;
                    final_res["output"] = exec_res.output;
                    final_res["time_ms"] = exec_res.time_ms;
                    final_res["memory_kb"] = exec_res.memory_kb;

                    co_await ws.async_write(net::buffer(json::serialize(final_res)), net::use_awaitable);
                }
            } else {
                // 如果不是 WS 升级请求（比如普通 GET），直接返回 400 Bad Request
                http::response<http::string_body> res{http::status::bad_request, req.version()};
                res.set(http::field::server, "BlogPlayground-Daemon");
                res.body() = "WebSocket Upgrade Required";
                res.prepare_payload();
                co_await http::async_write(stream, res, net::use_awaitable);
            }
        } catch (std::exception const& e) {
            // 捕获正常断开或解析异常
        }
    }
}