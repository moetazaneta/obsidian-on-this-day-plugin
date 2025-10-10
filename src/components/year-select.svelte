<script lang="ts">
  let {
    value = $bindable(),
    min = 2000,
    max = new Date().getFullYear(),
  }: {
    value: number,
    min?: number,
    max?: number,
  } = $props();
</script>

<select
  class="dropdown"
  name='year'
  id='year'
  bind:value={value}
>
  {#each Array.from({ length: max - min + 1 }, (_, index) => index + min) as year}
    <option value={year}>{year}</option>
  {/each}
</select>