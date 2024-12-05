const tools = document.querySelectorAll(".tool");
const materialPanel = document.getElementById("material-panel");
const materialContent = document.getElementById("material-content");
const closePanel = document.getElementById("close-panel");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let objects = []; // 存储所有的图片对象
let selectedObject = null; // 当前选中的图片对象
let dragging = false; // 是否在拖动
let resizing = false; // 是否在调整大小
let resizeDirection = null; // 当前调整的方向

const CONTROL_SIZE = 16; // 控制点大小

const materials = {
  head: ["heads/1.png", "heads/2.png", "heads/3.png", "heads/4.png","heads/5.png","heads/6.png","heads/11.png","heads/12.png","heads/13.png","heads/14.png"],
  hands: ["hands/1.png", "hands/2.png","hands/3.png","hands/4.png","hands/5.png","hands/6.png","hands/7.png","hands/8.png","hands/9.png","hands/10.png","hands/11.png","hands/12.png","hands/13.png","hands/14.png","hands/15.png","hands/16.png"],
  body: ["body/1.png", "body/2.png","body/3.png","body/4.png","body/5.png","body/6.png","body/7.png","body/8.png","body/9.png","body/10.png","body/11.png","body/12.png","body/14.png","body/15.png"],
  legs: ["legs/1.png", "legs/2.png","legs/3.png","legs/4.png","legs/5.png","legs/6.png","legs/7.png","legs/8.png","legs/9.png"],
  accessories: ["assets/1.png","assets/2.png","assets/3.png","assets/4.png","assets/5.png","assets/6.png","assets/7.png","assets/8.png","assets/9.png","assets/10.png","assets/11.png","assets/12.png","assets/13.png","assets/14.png","assets/15.png","assets/16.png"],
  patterns: ["pattern/1.png","pattern/2.png","pattern/3.png","pattern/4.png","pattern/5.png","pattern/6.png","pattern/7.png","pattern/8.png","pattern/9.png","pattern/10.png","pattern/11.png","pattern/12.png","pattern/13.png"],
};

// 点击工具按钮打开素材面板
tools.forEach((tool) => {
  tool.addEventListener("click", () => {
    const category = tool.getAttribute("data-category");
    if (category) {
      loadMaterials(category);
      materialPanel.style.display = "block";
    }
  });
});

// 关闭面板
closePanel.addEventListener("click", () => {
  materialPanel.style.display = "none";
});

// 加载素材到面板
function loadMaterials(category) {
  materialContent.innerHTML = ""; // 清空当前内容

  const categoryMaterials = materials[category];
  if (categoryMaterials && categoryMaterials.length > 0) {
    categoryMaterials.forEach((src) => {
      const materialItem = document.createElement("div");
      materialItem.classList.add("material-item");
      const img = document.createElement("img");
      img.src = src;
      materialItem.appendChild(img);

      materialItem.addEventListener("click", () => {
        addToCanvas(src); // 点击素材加载到画布
      });

      materialContent.appendChild(materialItem);
    });
  } else {
    materialContent.innerHTML = "<p>No materials available for this category.</p>";
  }
}

// 加载素材到画布
function addToCanvas(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const object = {
      img: img,
      x: 150, // 默认位置
      y: 150,
      width: 100, // 默认大小
      height: 100,
      rotation: 0, // 默认旋转角度
    };
    objects.push(object); // 添加到对象列表
    selectedObject = object; // 设置为当前选中对象
    drawCanvas(); // 重绘画布
  };
}

// 绘制画布
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  objects.forEach((object) => {
    ctx.save();
    ctx.translate(object.x + object.width / 2, object.y + object.height / 2);
    ctx.rotate((object.rotation * Math.PI) / 180);
    ctx.drawImage(object.img, -object.width / 2, -object.height / 2, object.width, object.height);
    ctx.restore();
  });

  if (selectedObject) {
    drawControls(selectedObject); // 绘制控制点
  }
}

// 绘制控制点
function drawControls(object) {
  const controls = getResizeControls(object);

  // 绘制调整大小的控制点
  ctx.fillStyle = "blue";
  controls.forEach((control) => {
    ctx.fillRect(control.x - CONTROL_SIZE / 2, control.y - CONTROL_SIZE / 2, CONTROL_SIZE, CONTROL_SIZE);
  });
}

// 鼠标事件监听
canvas.addEventListener("mousedown", (e) => {
    const { offsetX, offsetY } = e;
  
    selectedObject = null; // 先取消所有选中状态
    objects.forEach((object, index) => {
      if (isInsideObject(offsetX, offsetY, object)) {
        selectedObject = object; // 如果点击在某个对象内，设为选中
        // 将该对象从数组中移除并添加到末尾
        objects.splice(index, 1); // 从原位置移除
        objects.push(selectedObject); // 添加到数组末尾
      }
    });
  
    if (selectedObject) {
      if (isInsideResizeControl(offsetX, offsetY, selectedObject)) {
        resizing = true;
        resizeDirection = getResizeDirection(offsetX, offsetY, selectedObject); // 获取调整方向
      } else if (isInsideObject(offsetX, offsetY, selectedObject)) {
        dragging = true; // 开始拖动
      }
    }
    drawCanvas(); // 重绘画布
  });
  

canvas.addEventListener("mousemove", (e) => {
  const { offsetX, offsetY } = e;

  if (selectedObject) {
    if (resizing) {
      resizeObject(offsetX, offsetY, selectedObject, resizeDirection);
      drawCanvas();
    } else if (dragging) {
      selectedObject.x = offsetX - selectedObject.width / 2;
      selectedObject.y = offsetY - selectedObject.height / 2;
      drawCanvas();
    }
  }

  // 更新鼠标样式
  updateCursorStyle(offsetX, offsetY);
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
  resizing = false;
  resizeDirection = null;
});

// 判断是否点击在图像内
function isInsideObject(x, y, object) {
  return (
    object &&
    x > object.x &&
    x < object.x + object.width &&
    y > object.y &&
    y < object.y + object.height
  );
}

// 判断是否点击在调整大小的控制点上
function isInsideResizeControl(x, y, object) {
  const controls = getResizeControls(object);

  return controls.some(
    (control) =>
      x > control.x - CONTROL_SIZE / 2 &&
      x < control.x + CONTROL_SIZE / 2 &&
      y > control.y - CONTROL_SIZE / 2 &&
      y < control.y + CONTROL_SIZE / 2
  );
}

// 获取调整大小的控制点
function getResizeControls(object) {
  return [
    { x: object.x, y: object.y }, // 左上
    { x: object.x + object.width, y: object.y }, // 右上
    { x: object.x, y: object.y + object.height }, // 左下
    { x: object.x + object.width, y: object.y + object.height }, // 右下
  ];
}

// 获取调整的方向
function getResizeDirection(x, y, object) {
  const controls = getResizeControls(object);

  if (Math.abs(x - controls[0].x) < CONTROL_SIZE && Math.abs(y - controls[0].y) < CONTROL_SIZE) {
    return "top-left"; // 左上角
  } else if (Math.abs(x - controls[1].x) < CONTROL_SIZE && Math.abs(y - controls[1].y) < CONTROL_SIZE) {
    return "top-right"; // 右上角
  } else if (Math.abs(x - controls[2].x) < CONTROL_SIZE && Math.abs(y - controls[2].y) < CONTROL_SIZE) {
    return "bottom-left"; // 左下角
  } else if (Math.abs(x - controls[3].x) < CONTROL_SIZE && Math.abs(y - controls[3].y) < CONTROL_SIZE) {
    return "bottom-right"; // 右下角
  }
  return null;
}

// 调整对象大小
function resizeObject(x, y, object, direction) {
  if (direction === "top-left") {
    object.width += object.x - x;
    object.height += object.y - y;
    object.x = x;
    object.y = y;
  } else if (direction === "top-right") {
    object.width = x - object.x;
    object.height += object.y - y;
    object.y = y;
  } else if (direction === "bottom-left") {
    object.width += object.x - x;
    object.height = y - object.y;
    object.x = x;
  } else if (direction === "bottom-right") {
    object.width = x - object.x;
    object.height = y - object.y;
  }

  // 防止宽度和高度为负数
  if (object.width < 20) object.width = 20;
  if (object.height < 20) object.height = 20;
}

// 工具栏旋转按钮
document.getElementById("rotate").addEventListener("click", () => {
  if (selectedObject) {
    selectedObject.rotation += 15; // 每次点击旋转 15 度
    drawCanvas();
  }
});

// 更新鼠标样式
function updateCursorStyle(x, y) {
  let cursorStyle = "default";

  if (selectedObject) {
    if (isInsideResizeControl(x, y, selectedObject)) {
      cursorStyle = "nwse-resize"; // 调整大小的鼠标样式
    } else if (isInsideObject(x, y, selectedObject)) {
      cursorStyle = "move"; // 拖动的鼠标样式
    }
  }

  canvas.style.cursor = cursorStyle;
}
// 监听键盘事件
document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedObject) {
        // 删除选中的对象
        objects = objects.filter((object) => object !== selectedObject);
        selectedObject = null;
        drawCanvas(); // 重绘画布
      }
    }
  });
  document.getElementById("save").addEventListener("click", () => {
    const canvas = document.getElementById("canvas"); // 获取画布元素
    const link = document.createElement("a"); // 创建一个 <a> 标签
    link.download = "canvas-image.png"; // 下载文件的名称
    link.href = canvas.toDataURL("image/png"); // 将画布内容转换为图像 URL
    link.click(); // 触发点击事件，下载图像
  });
  // 清除画布内容
document.getElementById("clear").addEventListener("click", () => {
    objects = []; // 清空对象数组
    selectedObject = null; // 取消选中状态
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  });
  // 获取添加按钮和文件输入框
const addButton = document.getElementById("add");
const importImageInput = document.getElementById("import-image");

// 点击添加按钮时，触发文件输入框的点击
addButton.addEventListener("click", () => {
  importImageInput.click(); // 触发文件选择
});

// 监听文件输入框的变化
importImageInput.addEventListener("change", (event) => {
  const file = event.target.files[0]; // 获取用户选择的文件
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgSrc = e.target.result; // 获取图片的Base64编码URL
      addToCanvas(imgSrc); // 直接将图片添加到画布中
    };
    reader.readAsDataURL(file); // 读取文件内容并以Data URL格式输出
  }
});

// 将图片添加到画布上的函数
function addToCanvas(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const object = {
      img: img,
      x: 150, // 默认位置
      y: 150,
      width: 100, // 默认大小
      height: 100,
      rotation: 0, // 默认旋转角度
    };
    objects.push(object); // 添加到对象列表
    selectedObject = object; // 设置为当前选中对象
    drawCanvas(); // 重绘画布
  };
}
// 获取 Share 按钮
const shareButton = document.getElementById("share");

// 监听点击事件
shareButton.addEventListener("click", () => {
  // 将画布内容转换为图像数据
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error("Could not create blob from canvas");
      return;
    }

    const file = new File([blob], "canvas-image.png", {
      type: "image/png",
    });

    // 判断是否支持 Web Share API（需要文件分享功能）
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: "My Canvas Image",
        text: "Check out my creation!",
      })
      .then(() => console.log("Share successful"))
      .catch((error) => console.error("Share failed", error));
    } else {
      alert("Your browser does not support the Web Share API with files.");
    }
  }, "image/png");
});
// 监听键盘事件
document.addEventListener("keydown", (event) => {
    if (!selectedObject) return; // 如果没有选中的对象，不做任何处理
  
    const step = 5; // 每次移动的步长
  
    switch (event.key) {
      case "ArrowUp":
        selectedObject.y -= step; // 向上移动
        break;
      case "ArrowDown":
        selectedObject.y += step; // 向下移动
        break;
      case "ArrowLeft":
        selectedObject.x -= step; // 向左移动
        break;
      case "ArrowRight":
        selectedObject.x += step; // 向右移动
        break;
      default:
        return; // 如果按下的不是方向键，则不进行任何操作
    }
  
    drawCanvas(); // 重绘画布以更新对象的位置
  });
  