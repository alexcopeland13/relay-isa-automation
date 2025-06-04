
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Relay Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your mortgage lead management platform</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
