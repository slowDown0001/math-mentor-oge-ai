import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormulaBookletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FormulaBookletDialog = ({ open, onOpenChange }: FormulaBookletDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Справочник формул ОГЭ</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="algebra" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="algebra">Алгебра</TabsTrigger>
            <TabsTrigger value="geometry">Геометрия</TabsTrigger>
          </TabsList>
          
          <TabsContent value="algebra" className="mt-4">
            <div className="flex justify-center">
              <img 
                src="https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/Formulas/oge_f1.jpg" 
                alt="Формулы алгебры ОГЭ"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="geometry" className="mt-4">
            <div className="flex justify-center">
              <img 
                src="https://kbaazksvkvnafrwtmkcw.supabase.co/storage/v1/object/public/Formulas/oge_f2.jpg" 
                alt="Формулы геометрии ОГЭ"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaBookletDialog;