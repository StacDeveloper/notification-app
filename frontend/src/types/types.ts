export type Role = "ADMIN" | "STAFF"

export interface User{
    id:string 
    name:string 
    email:string 
    role:Role 
}

export interface Client{
    id:string 
    name:string 
    email:string
    company:string 
    createdAt:string 
}

export type EmailStatus = "PENDING" | "SENT" | "DELIVERED" | "BOUNCED" | "FAILED"

export interface EmailLog{
    id:string 
    clientId:string 
    clientName:string 
    subject:string 
    body:string 
    status:string 
    createdAt:string 
    updatedAt:string 
}

export interface Notification{
    id:string 
    title:string 
    message:string 
    read:boolean 
    createdAt:string
}

export interface DashboardSummary{
    sentToday:number 
    pending:number 
    failed:number 
}