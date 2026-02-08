import AppDataSource from './data-source';

const main = async () => {
  const args = process.argv.slice(2);
  const shouldRevert = args.includes('--revert');

  await AppDataSource.initialize();

  if (shouldRevert) {
    await AppDataSource.undoLastMigration();
  } else {
    await AppDataSource.runMigrations();
  }

  await AppDataSource.destroy();
};

main().catch(async (err) => {
  console.error(err);
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  } catch {
    // ignore
  }
  process.exit(1);
});
