import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./Sidebar";
import { ModeToggle } from "./mode-toggle";

export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-md px-6 sticky top-0 z-40 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
                <span className="font-bold">LMS</span>
            </div>
            <ModeToggle />
        </header>
    );
}
