#pragma once
#include "ioThreadPool.hpp"
#include <boost/asio/awaitable.hpp>
#include <boost/asio/ip/tcp.hpp>

namespace Playground::Network {
    // 负责接收 TCP 请求并将其派发至线程池
    boost::asio::awaitable<void> listener(boost::asio::ip::tcp::endpoint endpoint, ioThreadPool* pool);
}