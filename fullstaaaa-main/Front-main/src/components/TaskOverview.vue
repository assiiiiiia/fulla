<template>
  <div v-if="showMessage" class="task-overview">
    <div class="task-count">
      <i :class="['fa-solid', 'fa-bell', 'bell-icon', { ringing: isRinging }]" ></i>
      <span v-if="taskCount === 0">Vous n'avez aucune tâche aujourd'hui</span>
      <span v-else>Vous avez {{ taskCount }} tâche(s) Aujourd'hui!</span>
    </div>

    <button class="close-btn" @click="hideMessage">
      &times;
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      taskCount: 0,
      showMessage: true,
      isRinging: false // Contrôle de l'animation
    };
  },
  created() {
    axios.get('http://localhost:3000/api/tasks/today')
      .then(response => {
        this.taskCount = response.data.taskCount;
      })
      .catch(error => {
        console.error('Error fetching task count:', error);
      });
  },
  mounted() {
    this.isRinging = true;
    setTimeout(() => {
      this.isRinging = false;
    }, 5000); // Arrêter l'animation après 5 secondes
  },
  methods: {
    hideMessage() {
      this.showMessage = false;
    }
  },
};
</script>

<style scoped>
.task-overview {
  background-color: #f7eaff;
  color: #491784;
  padding: 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 150px 50px 300px;
  transition: transform 0.4s ease;
}

/* Style en mode sombre */
.dark-mode .task-overview {
  background-color: rgb(55, 54, 56);
  color: rgba(209, 209, 209, 0.858);
}

.dark-mode .bell-icon {
  color: hsl(268, 75%, 67%);
}

.task-count {
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.bell-icon {
  margin-right: 0.8rem;
  font-size: 1.8rem;
  cursor: pointer;
  color: hsl(268, 75%, 67%);
  transition: transform 0.1s ease-in-out;
}

/* Animation cloche qui "sonne" */
.ringing {
  animation: ring 0.5s ease-in-out infinite;
}

@keyframes ring {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(0deg);
}
}
.close-btn {
  border: none;
  color: #a198ac;
  font-size: 1.8rem;
  background: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: translateY(-3px) scale(1.05);
  color: #491784;
}
</style>
