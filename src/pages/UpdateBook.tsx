import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookById, updateBook } from "@/APIs/api";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

// Updated schema - files are optional for updates
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
    .optional()
    .refine(
      (file) =>
        !file || file.length === 0 || file[0]?.type.startsWith("image/"),
      "Cover image must be an image file"
    )
    .refine(
      (file) => !file || file.length === 0 || file[0]?.size <= 5 * 1024 * 1024, // 5MB
      "Cover image must be less than 5MB"
    ),
  file: z
    .instanceof(FileList)
    .optional()
    .refine(
      (file) =>
        !file || file.length === 0 || file[0]?.type === "application/pdf",
      "Book file must be a PDF"
    )
    .refine(
      (file) => !file || file.length === 0 || file[0]?.size <= 50 * 1024 * 1024, // 50MB
      "Book file must be less than 50MB"
    ),
});

const UpdateBook = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: bookData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookById(id as string),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 10000 * 5 * 10, // 10 seconds
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      genre: "",
      description: "",
    },
  });

  useEffect(() => {
    if (bookData?.data) {
      form.reset({
        title: bookData.data.title || "",
        genre: bookData.data.genre || "",
        description: bookData.data.description || "",
      });
    }
  }, [bookData, form]);

  const coverImageRef = form.register("coverImage");
  const fileRef = form.register("file");

  const mutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateBook(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      console.log("Book updated successfully");
      form.reset();
      navigate("/dashboard/books");
    },
    onError: (error) => {
      console.error("Error updating book:", error);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form Data:", data);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("genre", data.genre);
    formData.append("description", data.description);

    // Only append files if they exist
    if (data.coverImage && data.coverImage.length > 0) {
      formData.append("coverImage", data.coverImage[0]);
    }
    if (data.file && data.file.length > 0) {
      formData.append("file", data.file[0]);
    }

    // Log FormData contents for debugging
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Call mutation with both id and formData
    if (id) {
      mutation.mutate({ id, formData });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading book data...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">
            Error loading book data: {error.message}
          </p>
        </div>
      </section>
    );
  }

  // No data state
  if (!bookData?.data) {
    return (
      <section>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>No book data found</p>
        </div>
      </section>
    );
  }

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
                  <BreadcrumbPage>Update</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <LoaderCircle className="animate-spin" />
                )}
                <span className={`${mutation.isPending && "ml-1"}`}>
                  Update
                </span>
              </Button>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Update Book</CardTitle>
              <CardDescription>
                Update the details below to modify the book information.
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
                      <FormLabel>Cover Image (Optional)</FormLabel>
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
                      <FormLabel>Book File (Optional)</FormLabel>
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

export default UpdateBook;
