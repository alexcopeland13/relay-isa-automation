
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Showings = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Showing Agent Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Showing-Agent queue coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Showings;
