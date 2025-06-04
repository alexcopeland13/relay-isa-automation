
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Showings = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Property Showings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Showing management coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Showings;
