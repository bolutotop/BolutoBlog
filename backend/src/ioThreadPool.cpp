#include <ioThreadPool.hpp>
#include <iostream>

ioThreadPool::ioThreadPool(std::size_t size) : _ioContext(size), _works(size), _nextIOContext(0)
{
    for (std::size_t i = 0; i < size; i++)
    {
        _works[i] = std::unique_ptr<Work>(new Work(_ioContext[i].get_executor()));
    }
    // 遍历多个iocontext，创建多个线程，每个线程内部启动io_context
    for (std::size_t i = 0; i < _ioContext.size(); ++i)
    {
        _threads.emplace_back([this, i]()
                              { _ioContext[i].run(); });
    }
}
ioThreadPool::~ioThreadPool()
{
    std::cout << "io析构" << std::endl;
}

// 对外接口
boost::asio::io_context &ioThreadPool::getIOContext()
{
    std::lock_guard<std::mutex> lock(_mutex);//加锁确保分配安全
    auto &ioContext = _ioContext[_nextIOContext++];
    if (_nextIOContext == _ioContext.size())
    {
        _nextIOContext = 0;
    }
    return ioContext;
}

void ioThreadPool::stop()
{
    // 因为仅仅执行work.reset并不能让iocontext从run的状态中退出
    // 当iocontext已经绑定了读或写的监听事件后，还需要手动stop该服务。
    for (auto &work : _works)
    {
        // 把服务先停止
        work->get_executor().context().stop();
        work.reset();
    }

    for (auto &t : _threads)
    {
        t.join();
    }
}