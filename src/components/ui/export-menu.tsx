import { useState } from 'react';
import { 
  Download, 
  FileText, 
  File, 
  Mail, 
  Calendar, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ExportMenuProps {
  data: any[];
  filename?: string;
  exportableCols?: string[];
  supportedFormats?: ('csv' | 'pdf' | 'email')[];
  onExport?: (format: string, dateRange?: {from: Date, to: Date}) => Promise<void>;
}

export function ExportMenu({
  data,
  filename = 'export',
  exportableCols,
  supportedFormats = ['csv', 'pdf', 'email'],
  onExport
}: ExportMenuProps) {
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [date, setDate] = useState<{from: Date, to: Date}>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    to: new Date(),
  });
  const [emailAddress, setEmailAddress] = useState('');
  const { toast } = useToast();

  const handleExport = async (format: string) => {
    setExportFormat(format);
    
    if (format === 'email') {
      setShowDateDialog(true);
      return;
    }
    
    setShowDateDialog(true);
  };

  const processExport = async () => {
    if (!exportFormat) return;
    
    setExportLoading(true);
    
    try {
      if (onExport) {
        await onExport(exportFormat, date);
      } else {
        if (exportFormat === 'csv') {
          const headers = exportableCols || Object.keys(data[0] || {});
          let csvContent = headers.join(',') + '\n';
          
          data.forEach(item => {
            const row = headers.map(header => {
              let cell = item[header] || '';
              if (cell && cell.toString().includes(',')) {
                return `"${cell}"`;
              }
              return cell;
            });
            csvContent += row.join(',') + '\n';
          });
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const dateStr = format(new Date(), 'yyyy-MM-dd');
          
          link.setAttribute('href', url);
          link.setAttribute('download', `${filename}_${dateStr}.csv`);
          link.click();
        }
        
        if (exportFormat === 'pdf') {
          toast({
            title: "PDF Export",
            description: "PDF export functionality requires server integration.",
          });
        }
        
        if (exportFormat === 'email') {
          toast({
            title: "Email Export",
            description: `Export will be sent to ${emailAddress} when ready.`,
          });
        }
      }
      
      setShowDateDialog(false);
      setExportFormat(null);
      
      toast({
        title: "Export Successful",
        description: exportFormat === 'email' 
          ? `Export will be sent to ${emailAddress} shortly.`
          : `Data exported successfully as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      });
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {supportedFormats.includes('csv') && (
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="mr-2 h-4 w-4 text-blue-600" />
              Export as CSV
            </DropdownMenuItem>
          )}
          
          {supportedFormats.includes('pdf') && (
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <File className="mr-2 h-4 w-4 text-red-600" />
              Export as PDF
            </DropdownMenuItem>
          )}
          
          {supportedFormats.includes('email') && (
            <DropdownMenuItem onClick={() => handleExport('email')}>
              <Mail className="mr-2 h-4 w-4 text-purple-600" />
              Send via Email
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={(newDate: any) => setDate(newDate)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {exportFormat === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter recipient email"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={processExport} disabled={exportLoading}>
              {exportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
