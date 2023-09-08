function formatDictData(results) {
  // 创建一个空对象来存储归类后的数据
  const groupedData = {};
  results.forEach((item) => {
    const { dict_type } = item;
    // 如果该 dict_type 在 groupedData 中不存在，则创建一个数组存储数据
    if (!groupedData[dict_type]) {
      groupedData[dict_type] = [];
    }

    // 将数据项添加到对应的 dict_type 分组中
    groupedData[dict_type].push({ dictName: item.dict_name, dictValue: item.dict_value, dictKey: item.dict_type });
  });
  return groupedData;
}
module.exports = {
  formatDictData,
};
