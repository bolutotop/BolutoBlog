cmake_minimum_required(VERSION 3.20)
project(BlogPlaygroundDaemon VERSION 1.0.0)

# 强制 C++20 标准
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找 Boost 1.86 组件 (需根据实际安装路径调整 BOOST_ROOT)
find_package(Boost 1.86 REQUIRED COMPONENTS system thread json)

# 包含目录
include_directories(${Boost_INCLUDE_DIRS} include)

# 递归编译 src 目录下的所有 C++ 文件
file(GLOB SOURCES "src/*.cpp")
add_executable(${PROJECT_NAME} ${SOURCES})

# 链接库 (Boost, pthread 适用于 Linux)
target_link_libraries(${PROJECT_NAME} PRIVATE Boost::system Boost::thread Boost::json pthread)

# 追加头文件搜索路径
include_directories(include)