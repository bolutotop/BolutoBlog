#include "server.hpp"
#include "ioThreadPool.hpp"
#include <boost/asio/co_spawn.hpp>
#include <boost/asio/detached.hpp>
#include <boost/asio/signal_set.hpp>
#include <iostream>

int main() {
    // 🚀 防御升级：每次服务启动前强制清场，回收上一次崩溃遗留的 cgroup 和挂载点
    std::cout << "[Daemon] Sweeping zombie sandboxes..." << std::endl;
    std::system("for i in $(seq 0 999); do isolate --cg -b $i --cleanup > /dev/null 2>&1; done");
    std::cout << "[Daemon] Environment sanitized." << std::endl;

    try {
        auto const address = boost::asio::ip::make_address("127.0.0.1");
        auto const port = static_cast<unsigned short>(8080);

        // 初始化工作线程池
        auto pool = ioThreadPool::getInstance();

        // 初始化主线程 Context (专职监听)
        boost::asio::io_context main_ioc{1};

        // 启动监听协程
boost::asio::co_spawn(
            main_ioc, 
            Playground::Network::listener(boost::asio::ip::tcp::endpoint{address, port}, pool.get()), // 修复: 追加 .get()
            boost::asio::detached
        );

// 注册退出信号
        boost::asio::signal_set signals(main_ioc, SIGINT, SIGTERM);
        signals.async_wait([&](boost::system::error_code, int) {
            std::cout << "\n[Daemon] Received kill signal. Force shutting down..." << std::endl;
            main_ioc.stop();
            // 放弃 pool->stop() 中的平滑等待 (t.join())，防止被死锁的 system() 卡住
            // 直接调用底层 API 终止当前进程组
            std::exit(EXIT_SUCCESS); 
        });
        // 运行主事件循环
        main_ioc.run();
        
    } catch (const std::exception& e) {
        std::cerr << "[Fatal] " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}