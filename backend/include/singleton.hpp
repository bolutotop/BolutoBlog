#pragma once
#include <memory>
#include <mutex>
#include <iostream>

template <typename T>
class singleton {
protected:
    singleton() = default;
    virtual ~singleton() = default; // 修复 1: 析构函数名必须与类名(小写s)完全一致

public:
    singleton(const singleton&) = delete;
    singleton& operator=(const singleton&) = delete;

    static std::shared_ptr<T> getInstance() {
        static std::once_flag flag;
        std::call_once(flag, []() {
            _instance = std::shared_ptr<T>(new T());
        }); // 修复 2: 补充此处缺失的分号
        return _instance;
    }

    void PrintAddress() {
        std::cout << _instance.get() << std::endl; // 修复 3: 补充 std::
    }

private:
    static std::shared_ptr<T> _instance;
};

template <typename T>
std::shared_ptr<T> singleton<T>::_instance = nullptr;