<script lang="ts">
  let {
    value = $bindable(),
  }: {
    value: number,
  } = $props();
</script>

<select class="dropdown" name='month' id='month' bind:value={value}>
  {#each Array.from({ length: 12 }, (_, index) => index) as month}
    <option value={month}>{window.moment(month + 1, 'MM').format('MMM')}</option>
  {/each}
</select>