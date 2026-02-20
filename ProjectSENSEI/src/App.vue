<template>
    <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

body {
  font-family: Arial, sans-serif;
}

.time-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 25%;
  min-width: 95px;
  text-align: center;
  background: #d1d5db;
  color: #111827;
  font-size: 16px;
  font-weight: bold;
  padding: 6px 10px;
  border-bottom-right-radius: 8px;
  border-top-left-radius: 18px;
}

</style>
