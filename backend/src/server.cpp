#include "server.hpp"
#include "websocket_session.hpp"
#include <boost/asio/co_spawn.hpp>
#include <boost/asio/detached.hpp>
#include <iostream>

namespace net = boost::asio;
using tcp = boost::asio::ip::tcp;

namespace Playground::Network {
    net::awaitable<void> listener(tcp::endpoint endpoint, ioThreadPool* pool) {
        auto executor = co_await net::this_coro::executor;
        tcp::acceptor acceptor(executor, endpoint);
        std::cout << "[Daemon] Listening on " << endpoint.address().to_string() << ":" << endpoint.port() << std::endl;

        for (;;) {
            tcp::socket socket = co_await acceptor.async_accept(net::use_awaitable);
            
            // 轮询获取线程池中的 io_context
            auto& worker_ioc = pool->getIOContext();
            
            // 将会话投递至 worker_ioc 所在的线程执行
            net::co_spawn(worker_ioc, do_session(std::move(socket)), net::detached);
        }
    }
}