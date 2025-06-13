import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

import { SidebarTrigger } from "../ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const UtilityButtons = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center">
      <span>Utility Buttons:&nbsp;</span>
      <ToggleGroup type="multiple" variant="default" size="sm">
        <ToggleGroupItem value="Sidebar" aria-label="Toggle Sidebar">
          <SidebarTrigger />
        </ToggleGroupItem>
        <ToggleGroupItem value="Theme" aria-label="Toggle Theme">
          <Button size="icon">
            <Sun
              onClick={() => {
                setTheme("dark");
              }}
              className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Moon
              onClick={() => {
                setTheme("light");
              }}
              className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default UtilityButtons;
