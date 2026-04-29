// Глобальные массивы для хранения данных
let variants = [];
let characteristics = [];
let scores = {};

// Добавление варианта
function addVariant() {
    const input = document.getElementById('variantInput');
    const name = input.value.trim();
    
    if (!name) {
        alert('Введите название варианта');
        return;
    }
    
    if (variants.includes(name)) {
        alert('Такой вариант уже существует');
        return;
    }
    
    variants.push(name);
    scores[name] = {};
    input.value = '';
    
    renderVariants();
    renderTable();
}

// Удаление варианта
function removeVariant(index) {
    const variant = variants[index];
    variants.splice(index, 1);
    delete scores[variant];
    
    renderVariants();
    renderTable();
}

// Отображение списка вариантов
function renderVariants() {
    const container = document.getElementById('variantsList');
    container.innerHTML = variants.map((variant, index) => `
        <div class="item-tag">
            ${variant}
            <button onclick="removeVariant(${index})">×</button>
        </div>
    `).join('');
}

// Добавление характеристики
function addCharacteristic() {
    const nameInput = document.getElementById('characteristicInput');
    const weightInput = document.getElementById('weightInput');
    
    const name = nameInput.value.trim();
    const weight = parseInt(weightInput.value) || 5;
    
    if (!name) {
        alert('Введите название характеристики');
        return;
    }
    
    if (characteristics.some(c => c.name === name)) {
        alert('Такая характеристика уже существует');
        return;
    }
    
    characteristics.push({ name, weight });
    nameInput.value = '';
    weightInput.value = '5';
    
    renderCharacteristics();
    renderTable();
}

// Удаление характеристики
function removeCharacteristic(index) {
    characteristics.splice(index, 1);
    renderCharacteristics();
    renderTable();
}

// Отображение списка характеристик
function renderCharacteristics() {
    const container = document.getElementById('characteristicsList');
    container.innerHTML = characteristics.map((char, index) => `
        <div class="item-tag">
            ${char.name} <span class="weight-display">(вес: ${char.weight})</span>
            <button onclick="removeCharacteristic(${index})">×</button>
        </div>
    `).join('');
}

// Отрисовка таблицы
function renderTable() {
    const container = document.getElementById('tableContainer');
    const calculateBtn = document.getElementById('calculateBtn');
    
    if (variants.length === 0 || characteristics.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                Добавьте хотя бы один вариант и одну характеристику для начала работы
            </div>
        `;
        calculateBtn.style.display = 'none';
        return;
    }
    
    calculateBtn.style.display = 'block';
    
    // Создаем таблицу
    let html = '<table><thead><tr><th>Вариант</th>';
    
    // Заголовки характеристик с весами
    characteristics.forEach(char => {
        html += `<th>${char.name}<br><small>Вес: ${char.weight}</small></th>`;
    });
    
    html += '<th>Общий балл</th></tr></thead><tbody>';
    
    // Строки для каждого варианта
    variants.forEach(variant => {
        html += `<tr data-variant="${variant}"><td>${variant}</td>`;
        
        characteristics.forEach(char => {
            const score = scores[variant][char.name] || '';
            html += `
                <td>
                    <input type="number" 
                           class="score-input" 
                           min="0" 
                           max="10" 
                           value="${score}"
                           onchange="updateScore('${variant}', '${char.name}', this.value)"
                           placeholder="0-10">
                </td>
            `;
        });
        
        html += `<td class="total-score">-</td></tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Обновление оценки
function updateScore(variant, characteristic, value) {
    if (!scores[variant]) {
        scores[variant] = {};
    }
    scores[variant][characteristic] = value ? parseFloat(value) : 0;
}

// Расчет результатов
function calculateScores() {
    const tbody = document.querySelector('table tbody');
    const rows = tbody.querySelectorAll('tr');
    
    let maxPossibleScore = 0;
    characteristics.forEach(char => {
        maxPossibleScore += char.weight * 10; // Максимальная оценка 10
    });
    
    let results = [];
    
    rows.forEach(row => {
        const variant = row.dataset.variant;
        let totalScore = 0;
        
        const inputs = row.querySelectorAll('.score-input');
        inputs.forEach((input, index) => {
            const char = characteristics[index];
            const score = parseFloat(input.value) || 0;
            totalScore += score * char.weight;
        });
        
        // Обновляем ячейку общего балла
        const totalCell = row.querySelector('.total-score');
        totalCell.textContent = totalScore.toFixed(1);
        
        // Определяем процент от максимального
        const percentage = (totalScore / maxPossibleScore) * 100;
        
        // Удаляем старые классы
        row.classList.remove('success', 'medium', 'failure');
        
        // Добавляем соответствующий класс
        if (percentage > 70) {
            row.classList.add('success');
        } else if (percentage >= 40) {
            row.classList.add('medium');
        } else {
            row.classList.add('failure');
        }
        
        results.push({ variant, totalScore, percentage });
    });
    
    // Сортируем результаты по убыванию
    results.sort((a, b) => b.totalScore - a.totalScore);
    
    console.log('Результаты:', results);
}

// Обработка нажатия Enter в полях ввода
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('variantInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addVariant();
    });
    
    document.getElementById('characteristicInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCharacteristic();
    });
    
    document.getElementById('weightInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCharacteristic();
    });
});
