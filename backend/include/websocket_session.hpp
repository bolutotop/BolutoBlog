#pragma once
#include <boost/asio/awaitable.hpp>
#include <boost/asio/ip/tcp.hpp>

namespace Playground::Network {
    // 处理单个 WebSocket 客户端长连接的协程
    boost::asio::awaitable<void> do_session(boost::asio::ip::tcp::socket socket);
}