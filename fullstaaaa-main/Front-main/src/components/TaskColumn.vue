<template>
  <div class="status-column">
    <h3>{{ status }}</h3>
    <!-- Filter tasks based on status -->
    <TaskDisplay 
      v-for="task in filteredTasks" 
      :key="task.id" 
      :task="task" 
    />
  </div>
</template>

<script>
import axios from "axios";
import TaskDisplay from "./TaskDisplay.vue";

export default {
  name: "TaskColumn",
  components: { TaskDisplay },
  props: {
    status: String, // Le statut à afficher
  },
  data() {
    return {
      tasks: [], // Liste des tâches récupérées du backend
    };
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => task.status === this.status);
    },
  },
  mounted() {
    this.fetchTasks();
  },
  methods: {
  async fetchTasks() {
    try {
      const response = await axios.get("http://localhost:3001/tasks", {
        params: {
          status: this.status,  // Pass the status filter (e.g., 'pas commencé', 'en cours', 'terminé')
        }
      });
      this.tasks = response.data; // Stocke les tâches récupérées
    } catch (error) {
      console.error("Erreur de récupération des tâches :", error);
    }
  },
},

};
</script>

<style scoped>
.status-column {
  flex: 1;
  padding: 10px;
  border-left: 1.5px solid #5a327f;
}
h3 {
  color: rgb(86, 40, 129);
  margin-bottom: 50px;
}
.dark-mode ,h3,.status-column{
  color:hsl(268, 75%, 67%);
}
</style>
