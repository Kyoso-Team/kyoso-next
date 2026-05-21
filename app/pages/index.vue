<script setup lang="ts"></script>

<template>
  <main class="relative h-128">
    <div class="relative z-2 flex h-full w-screen items-center overflow-hidden opacity-20">
      <video src="/landing-bg-video.mp4" class="absolute w-full pb-2" autoplay loop>
        <track kind="captions" />
      </video>
    </div>
    <div
      class="from-background dark:from-background-900 to-background dark:to-background-900 absolute top-0 left-0 z-3 h-full w-screen bg-linear-to-t from-10% via-transparent via-50% to-90% dark:via-transparent"
    />
    <div
      class="absolute top-0 left-0 z-4 flex h-full w-screen flex-col items-center justify-center gap-4"
    >
      <h1 class="max-w-4xl px-4 text-center text-3xl font-bold tracking-tight sm:text-6xl">
        osu! tournament management beyond spreadsheets
      </h1>
      <p class="max-w-xl px-4 text-center text-lg text-zinc-900 dark:text-zinc-300">
        A web application for hosting osu! tournaments in a professional manner, regardless of scale
        or complexity.
      </p>
      <Button size="lg" disabled>Coming soon</Button>
    </div>
  </main>
</template>
