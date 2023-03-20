#include "buffer.hpp"
#include "emscripten/emscripten.h"
#include "shader.hpp"
#include <cmath>
#include <iostream>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

#pragma region 数据交互

EMSCRIPTEN_KEEPALIVE void test() {}

#pragma endregion

int main(int argc, char *argv[]) {
  std::cout << "wasm ready" << endl;
  std::cout << "input args:" << endl;
  for (int i = 0; i < argc; i++) {
    std::cout << argv[i] << endl;
  }
  return 0;
}
#ifdef __cplusplus
}
#endif