    import { User } from "./user";
    import { Set } from "./set";
    export class Training {
        id? : number
        
        trainingDate? : Date

        sets? : Set[]

        name: string

        isTrainingPlan?: boolean 

        trainingPlanId?: number;

        
    }