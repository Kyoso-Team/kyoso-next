<script setup lang="ts"></script>

<template>
  <main class="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
    <div class="max-w-4xl">
      <h1 class="text-center text-3xl">Kyoso Test Build</h1>
      <p class="mt-4 mb-2">
        This build of the website is for testing purposes only, it shall not be used to store real
        data for tournaments. Any data stored here is subject to be completely wiped. Do not share
        any differences between this build and the production version of this site, unless given
        permission.
      </p>
      <p>Only testers are allowed, login to osu! to identify if you are a tester or not.</p>
      <div class="mt-4 flex justify-center">
        <Button as="a" href="/api/auth/login"> Login </Button>
      </div>
    </div>
  </main>
</template>
