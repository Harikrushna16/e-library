import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBook } from "@/APIs/api";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  genre: z.string().min(2, {
    message: "Genre must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  coverImage: z
    .instanceof(FileList)
    .refine((file) => file.length === 1, "Cover Image is required")
    .refine(
      (file) => file[0]?.type.startsWith("image/"),
      "Cover image must be an image file"
    )
    .refine(
      (file) => file[0]?.size <= 5 * 1024 * 1024, // 5MB
      "Cover image must be less than 5MB"
    ),
  file: z
    .instanceof(FileList)
    .refine((file) => file.length === 1, "Book PDF is required")
    .refine(
      (file) => file[0]?.type === "application/pdf",
      "Book file must be a PDF"
    )
    .refine(
      (file) => file[0]?.size <= 50 * 1024 * 1024, // 50MB
      "Book file must be less than 50MB"
    ),
});

const CreateBook = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      genre: "",
      description: "",
    },
  });

  const coverImageRef = form.register("coverImage");
  const fileRef = form.register("file");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      console.log("Book created successfully");
      form.reset();
      navigate("/dashboard/books");
    },
    onError: (error) => {
      console.error("Error creating book:", error);
      // You might want to show an error toast here
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form Data:", data);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("genre", data.genre);
    formData.append("description", data.description);
    formData.append("coverImage", data.coverImage[0]);
    formData.append("file", data.file[0]);

    // Log FormData contents for debugging
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    mutation.mutate(formData);
  };

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/books">Books</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <LoaderCircle className="animate-spin" />
                )}
                <span className={`${mutation.isPending && "ml-1"}`}>
                  Submit
                </span>
              </Button>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Create a New Book</CardTitle>
              <CardDescription>
                Fill in the details below to create a new book.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input type="text" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input type="text" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={() => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          accept="image/*"
                          {...coverImageRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>Book File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          accept=".pdf"
                          {...fileRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </section>
  );
};

export default CreateBook;
