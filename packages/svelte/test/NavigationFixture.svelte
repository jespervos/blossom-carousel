<script lang="ts">
  import { useBlossomNavigation } from "../src/index.js";

  let { forId }: { forId: string } = $props();

  const nav = useBlossomNavigation(() => forId);
</script>

<output data-count>{nav.count}</output>
<output data-active>{nav.activeIndex}</output>
<output data-next>{nav.canNext}</output>
