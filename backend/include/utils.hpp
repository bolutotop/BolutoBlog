#pragma once
#include <string>
#include <filesystem>

namespace Playground::Utils {
    // 生成 16 位 UUID 用于隔离目录
    std::string generate_task_id();
    
    // 读取指定路径的文件内容
    std::string read_file(const std::filesystem::path& path);
}