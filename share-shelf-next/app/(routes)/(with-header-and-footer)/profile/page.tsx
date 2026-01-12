"use client";

import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetProfile } from "./action";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library } from "./components";

export default function Profile() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token?.accessToken) {
      router.push("/");
    }
  }, [token, router]);

  const { data, isLoading } = useGetProfile();

  console.log(data);

  return (
    <div className="mt-34 container mx-auto">
      {isLoading ? (
        <>loading</>
      ) : (
        <>
          <div className="flex justify-between">
            <div>
              <h2 className="heading-4">{data?.name}</h2>
              <div className="mt-1 flex gap-2.5">
                <span>0 following</span>
                <span>0 followers</span>
                <span>0 books exchanged</span>
              </div>
            </div>
            <figure className="rounded-full overflow-hidden">
              <Image
                alt=""
                src={data?.avatar ? data.avatar : "/avatar.jpeg"}
                height={80}
                width={80}
              />
            </figure>
          </div>
        </>
      )}
      <Tabs defaultValue="Library" className="my-10">
        <TabsList>
          <TabsTrigger value="Library" className="body-lg">
            Library
          </TabsTrigger>
          <TabsTrigger value="Review" className="body-lg">
            Review
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Library">
          <Library />
        </TabsContent>
        <TabsContent value="Review">Change your Review here.</TabsContent>
      </Tabs>
    </div>
  );
}
