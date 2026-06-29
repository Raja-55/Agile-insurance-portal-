import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function useSettings(){

    const [settings,setSettings]=useState(null);

    useEffect(()=>{

        const load=async()=>{

            const res=await apiRequest("/api/admin/settings");

            setSettings(res.data);

        }

        load();

    },[])

    return settings;

}