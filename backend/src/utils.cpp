#include "utils.hpp"
#include <fstream>
#include <random>

namespace Playground::Utils {
    std::string generate_task_id() {
        static const char alphanum[] = "0123456789abcdef";
        std::string id;
        
        // 【强制修复】使用 thread_local，让每个工作线程拥有独立的随机数引擎实例
        // 彻底消除并发争用导致的状态破坏和无限循环
        thread_local std::mt19937 gen(std::random_device{}());
        std::uniform_int_distribution<> dis(0, 15);
        
        for (int i = 0; i < 16; ++i) id += alphanum[dis(gen)];
        return id;
    }

    std::string read_file(const std::filesystem::path& path) {
        if (!std::filesystem::exists(path)) return "";
        std::ifstream ifs(path);
        return std::string((std::istreambuf_iterator<char>(ifs)), (std::istreambuf_iterator<char>()));
    }
}