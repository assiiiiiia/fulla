<template>
  <div class="task-status-container">
    <!-- Loop through the taskStatuses and pass tasks and status to TaskColumn -->
    <TaskColumn v-for="(tasks, status) in taskStatuses" :key="status" :status="status" :tasks="tasks" />
  </div>
</template>

<script>
import axios from "axios";
import TaskColumn from "./TaskColumn.vue";

export default {
  name: "TaskStatus",
  components: { TaskColumn },
  data() {
    return {
      taskStatuses: {
        "Not Started": [],    // Correspond à "pas commencé"
        "In Progress": [],    // Correspond à "en cours"
        "Done": [],           // Correspond à "terminé"
      },
    };
  },
  async mounted() {
    await this.fetchTasks();
  },
  methods: {
    async fetchTasks() {
      try {
        const response = await axios.get("http://localhost:3001/tasks");
        this.categorizeTasks(response.data);
      } catch (error) {
        console.error("Erreur de récupération des tâches :", error);
      }
    },
    categorizeTasks(tasks) {
      // Réinitialiser les statuts à vide avant de les catégoriser
      this.taskStatuses["Not Started"] = [];
      this.taskStatuses["In Progress"] = [];
      this.taskStatuses["Done"] = [];

      tasks.forEach(task => {
        // Adaptation selon le statut en français dans la base de données
        if (task.status === "pas commencé") {
          this.taskStatuses["Not Started"].push(task);
        } else if (task.status === "en cours") {
          this.taskStatuses["In Progress"].push(task);
        } else if (task.status === "terminé") {
          this.taskStatuses["Done"].push(task);
        }
      });
    },
  },
};
</script>

<style scoped>
.task-status-container {
  display: flex;
  gap: 20px;
  margin-left: 150px;
  background: #eed4fd;
  padding: 40px;
  border-radius: 20px;
  margin-top: 60px;
  box-shadow: 0px 4px 6px rgba(123, 122, 122, 0.963);
  transition: 0.5s;
}
.dark-mode .task-status-container{
  background-color:rgb(55, 54, 56);
  box-shadow: 5px 18px 22px rgba(0, 0, 0, 0.324);
}
</style>
