<template>
  <div>
    <!-- Sidebar Button to Open the Form -->
    <button @click="openForm" class="sidebar-btn">Ajouter Tâche</button>

    <!-- Form Container -->
    <transition name="fade" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <div v-if="formVisible" class="modal-container">
        <!-- Modal Window -->
        <div class="modal-content">
          <!-- Form Header -->
          <h2 class="form-title">Créer une Nouvelle Tâche</h2>

          <!-- Form -->
          <form @submit.prevent="handleSubmit">
            <!-- Task Name -->
            <div class="input-group">
              <label for="taskName">Nom de la tâche *</label>
              <input
                type="text"
                id="taskName"
                v-model="task.task_name"
                placeholder="Entrez le nom de la tâche"
              />
              <span v-if="!task.task_name && isSubmitted" class="error">Ce champ est obligatoire.</span>
            </div>

            <!-- Category Selection -->
            <div class="input-group">
              <label>Catégorie *</label>
              <div class="categories">
                <div
                  v-for="category in categories"
                  :key="category.name"
                  :class="['category-item', { selected: task.category === category.name }]"
                  @click="task.category = category.name"
                >
                  <i :class="category.icon"></i> {{ category.name }}
                </div>
              </div>
              <span v-if="!task.category && isSubmitted" class="error">Veuillez choisir une catégorie.</span>
            </div>

            <!-- Date -->
            <div class="input-group">
              <label for="date">Date *</label>
              <input type="date" id="date" v-model="task.due_date" />
              <span v-if="!task.due_date && isSubmitted" class="error">Veuillez sélectionner une date.</span>
            </div>

            <!-- Time -->
            <div class="input-group">
              <label for="time">Heure (Optionnel)</label>
              <input type="time" id="time" v-model="task.due_time" />
            </div>

            <!-- Importance Level -->
            <div class="input-group">
              <label>Niveau d'importance</label>
              <div class="importance-levels">
                <div
                  v-for="level in importanceLevels"
                  :key="level.value"
                  :class="['importance-level', { selected: task.priority === level.value }]"
                  @click="task.priority = level.value"
                >
                  {{ level.label }}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="button-group">
              <button type="button" class="btn btn-cancel" @click="resetForm">Annuler</button>
              <button type="submit" class="btn btn-add">Ajouter</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Task List Preview -->
    <div class="task-list">
      <h3>Liste des Tâches</h3>
      <div v-for="(task, index) in tasks" :key="index" class="task-card">
        <div class="task-info">
          <i :class="getCategoryIcon(task.category)" class="task-category-icon"></i>
          <div class="task-details">
            <h4>{{ task.task_name }}</h4>
            <p>{{ task.category }} - {{ task.due_date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      task: {
        name: '',
        category: '',
        importance: 'low',
        date: '',
        time: '',
      },
      tasks: [],
      categories: [
        { name: 'Travail', icon: 'fas fa-briefcase' },
        { name: 'Etude', icon: 'fas fa-book' },
        { name: 'Maison', icon: 'fas fa-home' },
        { name: 'Personnel', icon: 'fas fa-user' },
        { name: 'Loisirs', icon: 'fas fa-gamepad' },
        { name: 'Autre', icon: 'fas fa-exclamation-circle' },
      ],
      importanceLevels: [
        { value: 'low', label: 'Moins important' },
        { value: 'medium', label: 'Important' },
        { value: 'high', label: 'Urgent' },
      ],
      progressBarWidth: 33,
      progressBarColor: '#9b59b6',
      importanceLabel: 'Moins Important',
      formVisible: false,
      isSubmitted: false,
    };
  },
  methods: {
    
    openForm() {
      this.formVisible = true;
    },
    handleSubmit() {
  this.isSubmitted = true;

  // Validate required fields
  if (!this.task.task_name  ||!this.task.category || !this.task.due_date) {
    console.error("Tous les champs obligatoires ne sont pas remplis.");
    return;
  }

  // Validate date is not overdue
  const currentDateTime = new Date();
  const dueDateTime = new Date(`${this.task.due_date}T${this.task.due_time || "00:00"}`);
  
  if (dueDateTime < currentDateTime) {
    alert("La date d'échéance ne peut pas être dans le passé.");
    return;
  }

  // Format data for backend
  const taskData = {
    ...this.task,
    due_date: this.task.due_date,
    due_time: this.task.due_time || "00:00:00", // Default time
    priority: this.task.priority || "low", // Ensure default priority
  };

  // Send data to backend
  axios
    .post("http://localhost:3000/tasks-add", taskData)
    .then((response) => {
      console.log("Réponse du serveur : ", response.data);
      this.resetForm();
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout de la tâche : ", error);
    });
},
    selectImportance(level) {
      this.task.importance = level;
      const settings = {
        low: { width: 33, color: '#9b59b6', label: 'Moins Important' },
        medium: { width: 70, color: '#f1c40f', label: 'Important' },
        high: { width: 100, color: '#e74c3c', label: 'Urgent' },
      };
      this.progressBarWidth = settings[level].width;
      this.progressBarColor = settings[level].color;
      this.importanceLabel = settings[level].label;
    },
    resetForm() {
      this.task = { name: '', category: '', importance: 'low', date: '', time: '' };
      this.progressBarWidth = 33;
      this.progressBarColor = '#9b59b6';
      this.importanceLabel = 'Moins Important';
      this.isSubmitted = false;
      this.formVisible = false;
    },
    beforeEnter(el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(20px)';
    },
    enter(el, done) {
      el.offsetHeight; // trigger reflow
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      done();
    },
    leave(el, done) {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = 0;
      el.style.transform = 'translateY(20px)';
      done();
    },
    getCategoryIcon(category) {
      const categoryObj = this.categories.find(c => c.name === category);
      return categoryObj ? categoryObj.icon : 'fas fa-question';
    },
    getImportanceColor(importance) {
      switch (importance) {
        case 'low':
          return '#9b59b6';
        case 'medium':
          return '#f1c40f';
        case 'high':
          return '#e74c3c';
        default:
          return '#9b59b6';
      }
    },
  },
};
</script>

<style scoped>
/* Global Styles for Dark Purple Theme */
body {
  font-family: Arial, sans-serif;
  background-color: #a878b8;
  color: #f5f5f5;
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(146, 144, 148, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #877c9c;
  padding: 40px;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
  position: relative;
  box-shadow: 0 4px 10px rgba(169, 86, 177, 0.717);
  color: white;
  overflow-y: auto;
}

.sidebar-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #9b59b6;
}



h2.form-title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  font-size: 16px;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.input-group .error {
  color: #e74c3c;
  font-size: 14px;
}

.categories {
  display: flex;
  justify-content: space-around;
}

.category-item {
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.category-item:hover {
  background-color: #662a75;
}

.category-item.selected {
  background-color: #9b59b6;
}

.importance-levels {
  display: flex;
  justify-content: space-around;
}

.importance-level {
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.importance-level.selected {
  background-color: #9b59b6;
}
/* Task Card Styles */
.task-list {
  margin: 50px auto; /* Centrage horizontal et marge en haut */
  padding: 20px;
  max-width: 60%;
  background-color: #a67bb2;
  border-radius: 10px;
}


.task-card {
  background-color: #57296bd9; /* Dark purple background for the card */
  color: white;
  border-radius: 10px;
  margin-bottom: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(207, 191, 208, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(252, 236, 255, 0.4);
}

.task-info {
  display: flex;
  align-items: center;
}

.task-category-icon {
  font-size: 30px;
  margin-right: 15px;
  color: #9b59b6;
}

.task-details h4 {
  font-size: 20px;
  margin: 0;
}

.task-details p {
  font-size: 14px;
  margin-top: 5px;
  color: #ccc;
}

.task-progress {
  flex-shrink: 0;
  width: 100px;
}

.progress-bar {
  background-color: #ddd;
  height: 10px;
  width: 100%;
  border-radius: 5px;
}

.progress {
  height: 100%;
  border-radius: 5px;
  text-align: center;
  line-height: 30px;
  color: white;
  font-weight: bold;
}

/* Category Icons Styling */
.task-category-icon {
  color: #9b59b6;
  transition: color 0.3s ease;
}

.task-category-icon:hover {
  color: #8e44ad;
}

.task-info .category-item {
  background-color: #9b59b6;
  border-radius: 5px;
  padding: 10px;
  transition: background-color 0.3s ease;
}

.task-info .category-item:hover {
  background-color: #8e44ad;
}

/* Progress Bar Styling */
.progress {
  background-color: #e74c3c;
  width: 50%;
  border-radius: 5px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.progress.low {
  background-color: #9b59b6;
}

.progress.medium {
  background-color: #f1c40f;
}

.progress.high {
  background-color: #e74c3c;
}

/* Task Card Text Colors */
.task-details h4 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.task-details p {
  color: #ccc;
}

.task-card .task-info {
  flex-grow: 1;
}


.progress-bar {
  background-color: #ddd;
  height: 10px;
  width: 100%;
  border-radius: 5px;
  margin: 10px 0;
}

.progress {
  height: 100%;
  border-radius: 5px;
  text-align: center;
  line-height: 30px;
  color: white;
  font-weight: bold;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #e74c3c;
  color: white;
}

.btn-add {
  background-color: #9b59b6;
  color: white;
}

.btn:hover {
  opacity: 0.8;
}
</style>
