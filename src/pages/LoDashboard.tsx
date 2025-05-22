
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LoDashboard = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loan Officer Assistant Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loan-side dashboard coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LoDashboard;
