export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      fetch(env.APP_BACKUP_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.BACKUP_TOKEN}` }
      }).then((response) => {
        if (!response.ok) throw new Error(`Backup failed with status ${response.status}`);
      })
    );
  }
};

