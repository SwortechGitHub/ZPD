const draggables = document.querySelectorAll('.draggable');
const container = document.querySelectorAll('.container')[1];

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', (event) => {
        const draggedElement = event.target;
        draggedElement.classList.remove('dragging');

        const afterElement = getDragAfterElement(container, event.clientY);
        const newDraggable = draggedElement.cloneNode(true);
        if (afterElement == null) {
        container.appendChild(newDraggable);
        } else {
        container.insertBefore(newDraggable, afterElement);
        }
    });
});

container.addEventListener('dragover', (event) => {
    event.preventDefault();
    
    const afterElement = getDragAfterElement(container, event.clientY);
  
    if (draggedElement && draggedElement.parentElement === container) {
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
    }
  });

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
