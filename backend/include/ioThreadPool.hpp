#pragma once

#include "singleton.hpp"
#include <boost/asio.hpp>
#include <vector>
#include<mutex>
class ioThreadPool : public singleton<ioThreadPool>
{
    friend class singleton<ioThreadPool>; // 可访问成员
public:
    using IOContext = boost::asio::io_context;
    using Work = boost::asio::executor_work_guard<IOContext::executor_type>; // ​防止io_context::run()提前退出​
    using Work_ptr = std::unique_ptr<Work>;
    ~ioThreadPool();
    ioThreadPool(const ioThreadPool &) = delete; // 禁用拷贝构造
    ioThreadPool &operator=(const ioThreadPool &) = delete;

    boost::asio::io_context &getIOContext();
    void stop();

private:
    ioThreadPool(std::size_t size = std::thread::hardware_concurrency());
    std::vector<IOContext> _ioContext;
    std::vector<Work_ptr> _works;
    std::vector<std::thread> _threads;
    std::size_t _nextIOContext; // 被初始化为0
    std::mutex _mutex;
};