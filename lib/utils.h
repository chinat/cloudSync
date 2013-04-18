#ifndef UTILS_H
#define UTILS_H

#include <QStringList>
#include <QMap>
#include <QMapIterator>
#include <QVariant>

/**
  * conv stringlist to string
  */
auto listTJson = [](QStringList list)-> QString{
    return QString("[%1]").arg(list.join(QChar(',')));
};

/**
  * conv map to string
  */
auto mapTJson = [](QMap<QString, QVariant> map) -> QString {
    QString ret{"{"};
    QMapIterator iterator(map);
    while(iterator.hasNext()) {
        iterator.next();
        QVariant value = iterator.value();
        switch(value.type()) {
        case QVariant::Map: 
            ret += QString("%1:%2,").arg(iterator.key()).arg(mapTJson(value));
            break;
        case QVariant::List: 
            ret += QString("%1:%2,").arg(iterator.key()).arg(listTJson(value));
            break;
        case QVariant::Date:
        case QVariant::Time:
        case QVariant::DateTime:
            ret += QString("%1:%2,").arg(iterator.key()).arg(value.toString());
            break;
        default:
            ret += QString("%1:%2,").arg(iterator.key()).arg(value);
            break;
        }
    }
    ret.replace(ret.length() - 1, 1, '}');
    return ret;
};


#endif // UTILS_H
