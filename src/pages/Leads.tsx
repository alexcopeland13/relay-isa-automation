
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Leads = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Leads Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Lead management coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Leads;
