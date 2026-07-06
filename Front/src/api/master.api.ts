import http from "./http";

export interface MachineDTO {
  id?: number;
  machineIdentNo: string;
  machineName: string;
  model?: string;
  yearOfInstallation?: number;
  dailyWeeklyChecklistNo?: string;
  halfYearlyChecklistNo?: string;
  remarks?: string;
}

export const getMachines = () => http.get("/machines");
export const createMachine = (data: MachineDTO) => http.post("/machines", data);
export const updateMachine = (id: number, data: MachineDTO) => http.put(`/machines/${id}`, data);
export const deleteMachine = (id: number) => http.delete(`/machines/${id}`);
