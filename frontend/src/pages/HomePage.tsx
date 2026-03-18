import { BalanceCards } from '../components/BalanceCards';
import { HistoryList } from '../components/HistoryList';
import { Layout } from '../components/Layout';
import { RolePills } from '../components/RolePills';
import { Timeline } from '../components/Timeline';

export function HomePage() {
  return (
    <Layout>
      <RolePills />
      <BalanceCards />
      <Timeline />
      <HistoryList />
    </Layout>
  );
}
