<template>
  <q-item
    clickable
    v-ripple
    :to="link"
    active-class="bg-grey-3 text-grey-8"
    :disable="disable"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <!-- <q-item-label caption>{{ caption }}</q-item-label> -->
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'EssentialLink',
});

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
  disable?: boolean;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
  disable: false,
});
</script>
