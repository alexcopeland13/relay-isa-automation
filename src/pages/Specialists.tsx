
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Specialists = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Real Estate Specialists</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Specialist management coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Specialists;
