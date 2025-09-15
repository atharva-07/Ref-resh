import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "../ui/form";
import { Label } from "../ui/label";
import { SidebarInput } from "../ui/sidebar";

const formSchema = z.object({
  message: z.string({ required_error: "Message cannot be empty." }).max(400),
});

const SearchForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  return (
    <Form {...form}>
      <form>
        <div className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Type to search..."
            className="h-8 pl-7"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </div>
      </form>
    </Form>
  );
};

export default SearchForm;
